package com.example.idemgate.client;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

public class IdemgateClient {

	private final HttpClient http;
	private final ObjectMapper mapper;
	private final URI baseUri;
	private final String apiKey;
	private final Duration timeout;

	public IdemgateClient(String baseUrl, String apiKey) {
		this(baseUrl, apiKey, Duration.ofSeconds(10), HttpClient.newHttpClient());
	}

	public IdemgateClient(String baseUrl, String apiKey, Duration timeout, HttpClient http) {
		String normalized = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
		this.baseUri = URI.create(normalized);
		this.apiKey = apiKey;
		this.timeout = timeout;
		this.http = http;
		this.mapper = JsonMapper.builder().disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES).build();
	}

	public OperationView claim(ClaimRequest request) {
		return send("POST", "/v1/operations/claim", request, OperationView.class);
	}

	public CompletableFuture<OperationView> claimAsync(ClaimRequest request) {
		return sendAsync("POST", "/v1/operations/claim", request, OperationView.class);
	}

	public OperationView complete(UUID operationId, CompleteRequest request) {
		return send("POST", "/v1/operations/" + operationId + "/complete", request, OperationView.class);
	}

	public CompletableFuture<OperationView> completeAsync(UUID operationId, CompleteRequest request) {
		return sendAsync("POST", "/v1/operations/" + operationId + "/complete", request, OperationView.class);
	}

	public OperationView heartbeat(UUID operationId, String ownerToken) {
		return send("POST", "/v1/operations/" + operationId + "/heartbeat",
				java.util.Map.of("ownerToken", ownerToken), OperationView.class);
	}

	public OperationView get(UUID operationId) {
		return send("GET", "/v1/operations/" + operationId, null, OperationView.class);
	}

	public OperationView get(String scope, String key) {
		String path = "/v1/operations?scope=" + encode(scope) + "&key=" + encode(key);
		return send("GET", path, null, OperationView.class);
	}

	private <T> T send(String method, String path, Object body, Class<T> type) {
		try {
			return parse(http.send(build(method, path, body), HttpResponse.BodyHandlers.ofString()), type);
		}
		catch (IOException e) {
			throw new IdemgateClientException(0, "NETWORK_ERROR", e.getMessage());
		}
		catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new IdemgateClientException(0, "INTERRUPTED", e.getMessage());
		}
	}

	private <T> CompletableFuture<T> sendAsync(String method, String path, Object body, Class<T> type) {
		return http.sendAsync(build(method, path, body), HttpResponse.BodyHandlers.ofString())
				.thenApply(r -> parse(r, type))
				.exceptionally(ex -> {
					Throwable cause = ex.getCause() != null ? ex.getCause() : ex;
					if (cause instanceof IdemgateClientException ice) {
						throw ice;
					}
					throw new IdemgateClientException(0, "NETWORK_ERROR", cause.getMessage());
				});
	}

	private HttpRequest build(String method, String path, Object body) {
		HttpRequest.Builder builder = HttpRequest.newBuilder(baseUri.resolve(path))
				.timeout(timeout)
				.header("X-Api-Key", apiKey)
				.header("Accept", "application/json");
		if (body != null) {
			builder.header("Content-Type", "application/json");
			builder.method(method, HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)));
		}
		else {
			builder.method(method, HttpRequest.BodyPublishers.noBody());
		}
		return builder.build();
	}

	private <T> T parse(HttpResponse<String> response, Class<T> type) {
		int status = response.statusCode();
		String body = response.body() == null ? "" : response.body();
		if (status >= 200 && status < 300) {
			return mapper.readValue(body, type);
		}
		String code = "HTTP_" + status;
		String message = body;
		try {
			JsonNode node = mapper.readTree(body);
			if (node != null) {
				if (node.get("code") != null) {
					code = node.get("code").asString();
				}
				if (node.get("message") != null) {
					message = node.get("message").asString();
				}
			}
		}
		catch (Exception ignored) {
			// keep raw
		}
		throw new IdemgateClientException(status, code, message);
	}

	private static String encode(String value) {
		return URLEncoder.encode(value, StandardCharsets.UTF_8);
	}
}
