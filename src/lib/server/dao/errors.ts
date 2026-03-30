export class NotFoundError extends Error {
	constructor(
		public readonly entity: string,
		public readonly id: string
	) {
		super(`${entity} not found: ${id}`);
		this.name = 'NotFoundError';
	}
}

export class DuplicateError extends Error {
	constructor(
		public readonly entity: string,
		public readonly field: string
	) {
		super(`Duplicate ${entity} for field: ${field}`);
		this.name = 'DuplicateError';
	}
}

export class ForeignKeyError extends Error {
	constructor(
		public readonly entity: string,
		public readonly field: string,
		public readonly value: string
	) {
		super(`Foreign key violation: ${entity}.${field} = ${value} does not exist`);
		this.name = 'ForeignKeyError';
	}
}

export class CheckViolationError extends Error {
	constructor(
		public readonly constraint: string,
		message: string
	) {
		super(message);
		this.name = 'CheckViolationError';
	}
}
