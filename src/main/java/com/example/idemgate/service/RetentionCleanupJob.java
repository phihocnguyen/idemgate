package com.example.idemgate.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RetentionCleanupJob {

	private static final Logger log = LoggerFactory.getLogger(RetentionCleanupJob.class);

	private final IdempotencyService service;

	public RetentionCleanupJob(IdempotencyService service) {
		this.service = service;
	}

	@Scheduled(fixedDelayString = "${idemgate.cleanup-interval-ms:60000}")
	public void cleanup() {
		int deleted = service.cleanupExpired();
		if (deleted > 0) {
			log.info("Retention cleanup deleted {} operation(s)", deleted);
		}
	}
}
