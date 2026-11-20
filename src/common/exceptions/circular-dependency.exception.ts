import { ConflictException } from '@nestjs/common';

/** 409 with `code: "CIRCULAR_DEPENDENCY"`, as required by the brief. */
export class CircularDependencyException extends ConflictException {
  constructor(
    message = 'A movie cannot depend on itself, directly or through other movies.',
  ) {
    super({ code: 'CIRCULAR_DEPENDENCY', message });
  }
}
