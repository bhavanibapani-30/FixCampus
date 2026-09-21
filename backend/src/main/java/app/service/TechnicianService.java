package app.service;

import app.dto.DtoMapper;
import app.dto.RequestResponseDto;
import app.dto.ResolveRequestDto;
import app.dto.TechnicianDashboardDto;
import app.entity.MaintenanceRequest;
import app.entity.RequestPriority;
import app.entity.RequestStatus;
import app.entity.RequestUpdate;
import app.entity.User;
import app.repository.MaintenanceRequestRepository;
import app.repository.RequestUpdateRepository;
import app.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TechnicianService {

    private final MaintenanceRequestRepository requestRepository;
    private final RequestUpdateRepository updateRepository;
    private final UserRepository userRepository;

    public TechnicianService(
            MaintenanceRequestRepository requestRepository,
            RequestUpdateRepository updateRepository,
            UserRepository userRepository
    ) {
        this.requestRepository = requestRepository;
        this.updateRepository = updateRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public TechnicianDashboardDto getDashboardStats(String techEmail) {
        User tech = userRepository.findByEmail(techEmail)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found"));

        Long techId = tech.getId();
        long assigned = requestRepository.countByTechnicianIdAndStatus(techId, RequestStatus.ASSIGNED);
        long inProgress = requestRepository.countByTechnicianIdAndStatus(techId, RequestStatus.IN_PROGRESS);
        long resolved = requestRepository.countByTechnicianIdAndStatus(techId, RequestStatus.RESOLVED);
        long urgent = requestRepository.countByTechnicianIdAndPriority(techId, RequestPriority.URGENT)
                + requestRepository.countByTechnicianIdAndPriority(techId, RequestPriority.HIGH);

        List<RequestResponseDto> requests = requestRepository.findByTechnicianIdOrderByCreatedAtDesc(techId).stream()
                .map(DtoMapper::toRequestResponseDto)
                .collect(Collectors.toList());

        return TechnicianDashboardDto.builder()
                .assignedRequests(assigned)
                .inProgressRequests(inProgress)
                .resolvedRequests(resolved)
                .highPriorityRequests(urgent)
                .requests(requests)
                .build();
    }

    @Transactional(readOnly = true)
    public List<RequestResponseDto> getAssignedRequests(String techEmail) {
        User tech = userRepository.findByEmail(techEmail)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found"));

        return requestRepository.findByTechnicianIdOrderByCreatedAtDesc(tech.getId()).stream()
                .map(DtoMapper::toRequestResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RequestResponseDto getRequestDetails(Long id, String techEmail) {
        MaintenanceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));

        if (request.getTechnician() == null || !request.getTechnician().getEmail().equalsIgnoreCase(techEmail)) {
            throw new AccessDeniedException("You are not assigned to this maintenance request.");
        }

        return DtoMapper.toRequestResponseDto(request);
    }

    @Transactional
    public RequestResponseDto startWork(Long id, String techEmail) {
        MaintenanceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));

        User tech = userRepository.findByEmail(techEmail)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found"));

        if (request.getTechnician() == null || !request.getTechnician().getId().equals(tech.getId())) {
            throw new AccessDeniedException("You are not assigned to this maintenance request.");
        }

        if (request.getStatus() == RequestStatus.RESOLVED || request.getStatus() == RequestStatus.REJECTED) {
            throw new IllegalStateException("Cannot start work on a closed request.");
        }

        RequestStatus oldStatus = request.getStatus();
        request.setStatus(RequestStatus.IN_PROGRESS);
        MaintenanceRequest updated = requestRepository.save(request);

        RequestUpdate update = RequestUpdate.builder()
                .request(updated)
                .updatedBy(tech)
                .oldStatus(oldStatus)
                .newStatus(RequestStatus.IN_PROGRESS)
                .comment("Technician " + tech.getName() + " started maintenance work.")
                .build();
        updateRepository.save(update);

        return DtoMapper.toRequestResponseDto(updated);
    }

    @Transactional
    public RequestResponseDto resolveRequest(Long id, ResolveRequestDto dto, String techEmail) {
        MaintenanceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));

        User tech = userRepository.findByEmail(techEmail)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found"));

        if (request.getTechnician() == null || !request.getTechnician().getId().equals(tech.getId())) {
            throw new AccessDeniedException("You are not assigned to this maintenance request.");
        }

        RequestStatus oldStatus = request.getStatus();
        request.setStatus(RequestStatus.RESOLVED);
        request.setResolutionNotes(dto.getResolutionNotes().trim());
        MaintenanceRequest updated = requestRepository.save(request);

        RequestUpdate update = RequestUpdate.builder()
                .request(updated)
                .updatedBy(tech)
                .oldStatus(oldStatus)
                .newStatus(RequestStatus.RESOLVED)
                .comment("Technician resolved request with notes: " + dto.getResolutionNotes().trim())
                .build();
        updateRepository.save(update);

        return DtoMapper.toRequestResponseDto(updated);
    }
}
