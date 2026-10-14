package com.example.idemgate.demo;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.idemgate.spring.Idempotent;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api")
public class PaymentController {

	private final Map<String, String> chargesByOrder = new ConcurrentHashMap<>();

	public record ChargeRequest(@NotBlank String currency, @Min(1) long amountCents) {
	}

	public record ChargeResponse(String chargeId, String orderId, long amountCents, String currency) {
	}

	public record WebhookEvent(@NotBlank String eventId, @NotBlank String type, Map<String, Object> data) {
	}

	@Idempotent(scope = "payments", businessKey = "'order:' + #orderId + ':charge'")
	@PostMapping("/orders/{orderId}/charges")
	public ResponseEntity<ChargeResponse> charge(@PathVariable String orderId, @RequestBody ChargeRequest body) {
		String existing = chargesByOrder.get(orderId);
		if (existing != null) {
			return ResponseEntity.ok(new ChargeResponse(existing, orderId, body.amountCents(), body.currency()));
		}
		String chargeId = "ch_" + UUID.randomUUID().toString().substring(0, 8);
		chargesByOrder.put(orderId, chargeId);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ChargeResponse(chargeId, orderId, body.amountCents(), body.currency()));
	}

	@Idempotent(scope = "webhooks")
	@PostMapping("/webhooks/provider")
	public Map<String, String> webhook(@RequestBody WebhookEvent event) {
		return Map.of("received", event.eventId(), "type", event.type());
	}
}
