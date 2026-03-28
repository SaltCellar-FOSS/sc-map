/**
 * A Result type for handling success/error cases synchronously
 * Based on Rust's Result enum pattern
 */

export type Result<T, E> = Ok<T> | Err<E>;

export class Ok<T> {
	readonly ok = true as const;
	readonly err = false as const;

	constructor(readonly value: T) {}
}

export class Err<E> {
	readonly ok = false as const;
	readonly err = true as const;

	constructor(readonly error: E) {}
}

/**
 * Creates a successful Result
 */
export function ok<T>(value: T): Ok<T> {
	return new Ok(value);
}

/**
 * Creates an error Result
 */
export function err<E>(error: E): Err<E> {
	return new Err(error);
}