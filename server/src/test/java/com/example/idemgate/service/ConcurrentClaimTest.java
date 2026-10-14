package com.example.idemgate.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.example.idemgate.SupportPostgres;

@SpringBootTest
class ConcurrentClaimTest extends SupportPostgres {

	private static final String FP = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

	@Autowired
	IdempotencyService service;

	@Test
	void exactlyOneWinnerUnderParallelClaims() throws Exception {
		String scope = "payments";
		String key = "concurrent-" + System.nanoTime();
		int threads = 16;

		ExecutorService pool = Executors.newFixedThreadPool(threads);
		try {
			List<Callable<ClaimResult>> tasks = new ArrayList<>();
			for (int i = 0; i < threads; i++) {
				tasks.add(() -> service.claim(scope, key, FP, 300, "POST", "/pay", null));
			}
			List<Future<ClaimResult>> futures = pool.invokeAll(tasks);
			List<ClaimResult> results = new ArrayList<>();
			for (Future<ClaimResult> future : futures) {
				results.add(future.get(10, TimeUnit.SECONDS));
			}

			long winners = results.stream().filter(ClaimResult::claimed).count();
			assertThat(winners).isEqualTo(1);
			assertThat(results).allSatisfy(r -> assertThat(r.operation().idempotencyKey()).isEqualTo(key));
			assertThat(results.stream().map(r -> r.operation().id()).distinct()).hasSize(1);
		}
		finally {
			pool.shutdownNow();
		}
	}
}
