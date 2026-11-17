import type { CreateEventDto, UpdateEventDto } from "@/shared/contracts";

/**
 * The PATCH body for an edit made with the create form. `category` is not
 * editable and `status` changes only through publish/cancel (the server 409s
 * on a different status), so neither is sent. A cleared price or cover is sent
 * as `null` so the server removes it.
 */
export function toUpdateEventDto(dto: CreateEventDto): UpdateEventDto {
  const { category: _category, status: _status, ...rest } = dto;
  return {
    ...rest,
    price: dto.price ?? null,
    coverImageUrl: dto.coverImageUrl ?? null,
  };
}
