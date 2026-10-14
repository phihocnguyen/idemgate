package com.example.idemgate.api;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
class AdminApiTest extends SupportPostgres {

	private static final String FP = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
	private static final String API_KEY = "test-api-key";

	@Autowired
	MockMvc mockMvc;

	@Autowired
	ObjectMapper objectMapper;

	@Test
	void listAndDetailRedactBodyByDefault() throws Exception {
		MvcResult claim = mockMvc.perform(post("/v1/operations/claim").header("X-Api-Key", API_KEY)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"scope":"admin","key":"admin-1","fingerprint":"%s"}
						""".formatted(FP)))
				.andExpect(status().isOk())
				.andReturn();
		JsonNode claimJson = objectMapper.readTree(claim.getResponse().getContentAsString());
		String id = claimJson.get("operationId").asText();
		String token = claimJson.get("ownerToken").asText();

		mockMvc.perform(post("/v1/operations/" + id + "/complete").header("X-Api-Key", API_KEY)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"status":"COMPLETED","responseStatus":200,"responseBody":"{\\"secret\\":true}","ownerToken":"%s"}
						""".formatted(token)))
				.andExpect(status().isOk());

		mockMvc.perform(get("/v1/admin/operations").param("scope", "admin").header("X-Api-Key", API_KEY))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.total").value(1))
				.andExpect(jsonPath("$.items[0].responseBodyPresent").value(true))
				.andExpect(jsonPath("$.items[0].responseBody").value(nullValue()));

		mockMvc.perform(get("/v1/admin/operations/" + id).header("X-Api-Key", API_KEY))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.fingerprint").value(FP))
				.andExpect(jsonPath("$.responseBody").value(nullValue()));
	}

	@Test
	void settingsGetAndPatch() throws Exception {
		mockMvc.perform(get("/v1/admin/settings").header("X-Api-Key", API_KEY))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.retentionDays").exists())
				.andExpect(jsonPath("$.exposeResponseBody").value(false));

		mockMvc.perform(patch("/v1/admin/settings").header("X-Api-Key", API_KEY)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"retentionDays\":14}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.retentionDays").value(14));
	}
}
