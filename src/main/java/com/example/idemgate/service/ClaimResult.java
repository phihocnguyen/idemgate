package com.example.idemgate.service;

import com.example.idemgate.domain.Operation;

public record ClaimResult(boolean claimed, Operation operation) {
}
