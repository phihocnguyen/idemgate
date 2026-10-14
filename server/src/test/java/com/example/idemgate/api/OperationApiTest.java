package com.example.idemgate.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.example.idemgate.SupportPostgres;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class OperationApiTest extends SupportPostgres {

	private static final String FP = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
	private static final String API_KEY = "test-api-key";

	@Autowired
	MockMvc mockMvc;

	@Autowired
	ObjectMapper objectMapper;

	@Test
	void unauthorizedWithoutApiKey() throws Exception {
		mockMvc.perform(post("/v1/operations/claim").contentType(MediaType.APPLICATION_JSON).content("""
				{"scope":"s","key":"k","fingerprint":"%s"}
				""".formatted(FP))).andExpect(status().isUnauthorized());
	}

	@Test
	void claimCompleteReplayFlow() throws Exception {
		String claimBody = """
				{"scope":"payments","key":"ord_it_1","fingerprint":"%s","ttlSeconds":300}
				""".formatted(FP);

		MvcResult claim = mockMvc
				.perform(post("/v1/operations/claim").header("X-Api-Key", API_KEY)
						.contentType(MediaType.APPLICATION_JSON).content(claimBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.claimed").value(true))
				.andExpect(jsonPath("$.status").value("IN_PROGRESS"))
				.andReturn();

		JsonNode claimJson = objectMapper.readTree(claim.getResponse().getContentAsString());
		String operationId = claimJson.get("operationId").asText();
		String ownerToken = claimJson.get("ownerToken").asText();
		assertThat(ownerToken).isNotBlank();

		mockMvc.perform(post("/v1/operations/claim").header("X-Api-Key", API_KEY)
				.contentType(MediaType.APPLICATION_JSON).content(claimBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.claimed").value(false))
				.andExpect(jsonPath("$.status").value("IN_PROGRESS"));

		mockMvc.perform(post("/v1/operations/" + operationId + "/complete").header("X-Api-Key", API_KEY)
				.contentType(MediaType.APPLICATION_JSON).content("""
						{
						  "status":"COMPLETED",
						  "responseStatus":201,
						  "responseHeaders":{"Content-Type":"application/json"},
						  "responseBody":"{\\"chargeId\\":\\"ch_1\\"}",
						  "ownerToken":"%s"
						}
						""".formatted(ownerToken)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("COMPLETED"))
				.andExpect(jsonPath("$.response.body").value("{\"chargeId\":\"ch_1\"}"));

		MvcResult replay = mockMvc
				.perform(post("/v1/operations/claim").header("X-Api-Key", API_KEY)
						.contentType(MediaType.APPLICATION_JSON).content(claimBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.claimed").value(false))
				.andExpect(jsonPath("$.status").value("COMPLETED"))
				.andExpect(jsonPath("$.response.body").value("{\"chargeId\":\"ch_1\"}"))
				.andReturn();

		assertThat(objectMapper.readTree(replay.getResponse().getContentAsString()).get("operationId").asText())
				.isEqualTo(operationId);

		mockMvc.perform(get("/v1/operations").param("scope", "payments").param("key", "ord_it_1")
				.header("X-Api-Key", API_KEY)).andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("COMPLETED"));
	}

	@Test
	void payloadMismatchReturns409() throws Exception {
		String key = "ord_mismatch";
		mockMvc.perform(post("/v1/operations/claim").header("X-Api-Key", API_KEY)
				.contentType(MediaType.APPLICATION_JSON).content("""
						{"scope":"payments","key":"%s","fingerprint":"%s"}
						""".formatted(key, FP))).andExpect(status().isOk());

		String otherFp = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
		mockMvc.perform(post("/v1/operations/claim").header("X-Api-Key", API_KEY)
				.contentType(MediaType.APPLICATION_JSON).content("""
						{"scope":"payments","key":"%s","fingerprint":"%s"}
						""".formatted(key, otherFp)))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.code").value("PAYLOAD_MISMATCH"));
	}
}
