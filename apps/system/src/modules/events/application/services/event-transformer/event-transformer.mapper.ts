import { CreateEventRequestDto } from '../../../infra/dto/create-event.request.dto';
import { createEventId } from '../../../domain/value-objects/event-id';
import { CoEvent } from '../../../domain/entities/co-event';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class EventTransformerMapper {
  /**
   * Converts from request DTO Event
   *
   * NOTES
   * - this function adds an EventId if one is lacking
   * - dto.type will have already been checked in the service
   */
  public static fromRequestDto(dto: CreateEventRequestDto): CoEvent {
    const id = dto.eventId || createEventId();
    const payload = {
      id: dto.data.id,
    };
    return CoEvent.check({
      id,
      type: dto.type,
      payload,
    });
  }
}
