import { CreateEventDto } from './create-event.dto';
import { CreateEventRequestDto } from '../../../infra/dto/create-event.request.dto';
import { createEventId } from '../../../domain/value-objects/event-id';
import { CoEvent } from '../../../domain/entities/co-event';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateEventMapper {
  /**
   * Converts from request DTO to command DTO
   *
   * NOTE: this function adds an EventId if one is lacking
   */
  public static fromRequestDto(dto: CreateEventRequestDto): CreateEventDto {
    const eventId = dto.eventId || createEventId();
    return CreateEventDto.check({
      eventId,
      type: dto.type,
      data: dto.data,
    });
  }

  /**
   * Converts from command DTO to event
   *
   * NOTE: this feels superfluous
   */
  public static toEvent(dto: CreateEventDto): CoEvent {
    const payload = {
      id: dto.data.id,
    };
    return CoEvent.check({
      id: dto.eventId,
      type: dto.type,
      payload,
    });
  }
}
