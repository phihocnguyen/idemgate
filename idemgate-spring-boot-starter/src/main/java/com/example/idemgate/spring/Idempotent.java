package com.example.idemgate.spring;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Idempotent {

	/** Scope override; empty uses {@code idemgate.client.default-scope}. */
	String scope() default "";

	/** TTL seconds; 0 uses client default. */
	int ttlSeconds() default 0;

	/** Optional SpEL for business key, e.g. {@code #orderId}. */
	String businessKey() default "";
}
