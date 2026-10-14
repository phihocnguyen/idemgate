package com.example.idemgate.api.dto;

import java.util.List;

public record AdminOperationPage(List<AdminOperationView> items, long total, int limit, int offset) {
}
