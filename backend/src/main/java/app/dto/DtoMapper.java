package app.dto;

import app.entity.MaintenanceRequest;
import app.entity.RequestUpdate;
import app.entity.User;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class DtoMapper {

    public static UserDto toUserDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static RequestUpdateDto toRequestUpdateDto(RequestUpdate update) {
        if (update == null) return null;
        return RequestUpdateDto.builder()
                .id(update.getId())
                .updatedBy(toUserDto(update.getUpdatedBy()))
                .oldStatus(update.getOldStatus())
                .newStatus(update.getNewStatus())
                .comment(update.getComment())
                .createdAt(update.getCreatedAt())
                .build();
    }

    public static RequestResponseDto toRequestResponseDto(MaintenanceRequest request) {
        if (request == null) return null;

        List<RequestUpdateDto> updateDtos = Collections.emptyList();
        if (request.getUpdates() != null) {
            updateDtos = request.getUpdates().stream()
                    .map(DtoMapper::toRequestUpdateDto)
                    .collect(Collectors.toList());
        }

        return RequestResponseDto.builder()
                .id(request.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .location(request.getLocation())
                .priority(request.getPriority())
                .status(request.getStatus())
                .student(toUserDto(request.getStudent()))
                .technician(toUserDto(request.getTechnician()))
                .resolutionNotes(request.getResolutionNotes())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .updates(updateDtos)
                .build();
    }
}
