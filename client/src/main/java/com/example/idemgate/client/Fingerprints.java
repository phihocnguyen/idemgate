package com.example.idemgate.client;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Canonical fingerprint: SHA-256 hex of {@code METHOD\nPATH\n} + raw body bytes.
 * <p>
 * Example: {@code Fingerprints.sha256Hex("POST", "/api/charges", bodyBytes)}
 */
public final class Fingerprints {

	private Fingerprints() {
	}

	public static String sha256Hex(String method, String path, byte[] body) {
		String prefix = (method == null ? "" : method.toUpperCase()) + "\n" + (path == null ? "" : path) + "\n";
		byte[] prefixBytes = prefix.getBytes(StandardCharsets.UTF_8);
		byte[] payload = body == null ? new byte[0] : body;
		byte[] all = new byte[prefixBytes.length + payload.length];
		System.arraycopy(prefixBytes, 0, all, 0, prefixBytes.length);
		System.arraycopy(payload, 0, all, prefixBytes.length, payload.length);
		return sha256Hex(all);
	}

	public static String sha256Hex(String canonical) {
		return sha256Hex(canonical.getBytes(StandardCharsets.UTF_8));
	}

	public static String sha256Hex(byte[] bytes) {
		try {
			return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
		}
		catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException("SHA-256 not available", e);
		}
	}
}
