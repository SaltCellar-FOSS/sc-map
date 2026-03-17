interface Success<T> extends PromiseLike<T> {
	readonly ok: true;
	readonly value: T;
	[Symbol.iterator](): Generator<never, T, unknown>;
}

interface Failure<E extends Error> extends PromiseLike<never> {
	readonly ok: false;
	readonly error: E;
	[Symbol.iterator](): Generator<never, never, unknown>;
}

/**
 * Result of an operation that can succeed or fail.
 */
export type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

export const Result = {
	success,
	failure,
	gen,
	all,
	[Symbol.hasInstance](instance: unknown): instance is Result<unknown, Error> {
		return instance instanceof ResultImpl;
	}
};

// #region Core Implementation

class ResultImpl<T, E extends Error> implements PromiseLike<T> {
	readonly ok: boolean;
	readonly value: T | undefined;
	readonly error: E | undefined;

	constructor(ok: boolean, value?: T, error?: E) {
		this.ok = ok;
		this.value = value;
		this.error = error;
	}

	then<TResult1 = T, TResult2 = never>(
		onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
		onRejected?: ((reason: E) => TResult2 | PromiseLike<TResult2>) | undefined | null
	): Promise<TResult1 | TResult2> {
		const promise = this.ok ? Promise.resolve(this.value as T) : Promise.reject(this.error as E);

		if (onFulfilled || onRejected) {
			return promise.then(onFulfilled, onRejected);
		}

		return promise as Promise<TResult1 | TResult2>;
	}

	// eslint-disable-next-line require-yield
	*[Symbol.iterator](): Generator<never, T, unknown> {
		if (this.ok) {
			return this.value as T;
		} else {
			throw this.error;
		}
	}
}

function success(): Success<void>;
function success<T>(value: T): Success<T>;
function success(value?: unknown): Success<unknown> {
	return new ResultImpl<unknown, never>(true, value) as Success<unknown>;
}

function failure<E extends Error>(error: E): Failure<E> {
	return new ResultImpl<never, E>(false, undefined, error) as Failure<E>;
}

// #endregion

// #region Result.gen

/**
 * Runs a generator function and captures its result.
 * Use yield* to unwrap Result values or throw on errors.
 */
function gen<T, E extends Error>(
	generator: (this: null) => Generator<never, Result<T, E>, unknown>
): Result<T, E>;
function gen<T, E extends Error, ThisArg>(
	generator: (this: ThisArg) => Generator<never, Result<T, E>, unknown>,
	thisArg: ThisArg
): Result<T, E>;
function gen(
	generator: (this: unknown) => Generator<never, Result<unknown>, unknown>,
	thisArg: unknown = null
): Result<unknown> {
	try {
		const iter = generator.call(thisArg);
		while (true) {
			const next = iter.next();
			if (next.done) {
				return next.value;
			}
		}
	} catch (error) {
		return failure(error instanceof Error ? error : new Error(String(error)));
	}
}

// #endregion

// #region Result.all

class AggregateError extends Error {
	public readonly errors: Error[];

	constructor(errors: Error[], message?: string) {
		super(message ?? `AggregateError: ${errors.length} error(s) occurred`);
		this.name = 'AggregateError';
		this.errors = errors;
	}
}

type SuccessTuple<T extends readonly Result<unknown, Error>[]> = {
	[K in keyof T]: T[K] extends Result<infer S, Error> ? S : never;
};

/**
 * Combines multiple results. Returns success if all succeed, or failure with all errors.
 */
function all<const T extends readonly Result<unknown, Error>[]>(
	results: T
): Result<SuccessTuple<T>, AggregateError>;

function all<const T extends Record<string, Result<unknown>>>(
	results: T
): Result<
	{
		[K in keyof T]: T[K] extends Result<infer S, Error> ? S : never;
	},
	AggregateError
>;

function all<T, E extends Error>(results: Iterable<Result<T, E>>): Result<T[], AggregateError>;

function all(
	results: Iterable<Result<unknown, Error>> | Record<string, Result<unknown, Error>>
): Result<unknown, AggregateError> {
	if (Array.isArray(results)) {
		const successValues: unknown[] = [];
		const failureErrors: Error[] = [];

		for (const result of results) {
			if (result.ok) {
				successValues.push(result.value);
			} else {
				failureErrors.push(result.error);
			}
		}

		if (failureErrors.length > 0) {
			return failure(new AggregateError(failureErrors));
		}

		return success(successValues);
	} else {
		const successValues: Record<string, unknown> = {};
		const failureErrors: Error[] = [];

		for (const [key, result] of Object.entries(results)) {
			if (result.ok) {
				successValues[key] = result.value;
			} else {
				failureErrors.push(result.error);
			}
		}

		if (failureErrors.length > 0) {
			return failure(new AggregateError(failureErrors));
		}

		return success(successValues);
	}
}

// #endregion
