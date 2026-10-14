package com.example.idemgate.api.dto;

import jakarta.validation.constraints.NotBlank;

public record HeartbeatRequest(@NotBlank String ownerToken) {
}
