package com.example.idemgate.client;

import java.util.Map;

public record ResponseSnapshot(Integer status, Map<String, String> headers, String body) {
}
