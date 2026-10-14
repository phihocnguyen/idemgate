package com.example.idemgate.client;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

class FingerprintsTest {

	@Test
	void emptySha256() {
		assertEquals("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
				Fingerprints.sha256Hex(""));
	}

	@Test
	void canonicalIncludesMethodPathBody() {
		String a = Fingerprints.sha256Hex("POST", "/pay", "{}".getBytes(StandardCharsets.UTF_8));
		String b = Fingerprints.sha256Hex("POST", "/pay", "{\"x\":1}".getBytes(StandardCharsets.UTF_8));
		assertNotEquals(a, b);
	}
}
