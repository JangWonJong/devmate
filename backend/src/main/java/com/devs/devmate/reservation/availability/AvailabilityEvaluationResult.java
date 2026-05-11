package com.devs.devmate.reservation.availability;

public record AvailabilityEvaluationResult(
        boolean available,
        String reason
) {
    public static AvailabilityEvaluationResult success() {
        return new AvailabilityEvaluationResult(true, null);
    }

    public static AvailabilityEvaluationResult fail(String reason) {
        return new AvailabilityEvaluationResult(false, reason);
    }
}