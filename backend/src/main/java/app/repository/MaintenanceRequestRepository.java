package app.repository;

import app.entity.MaintenanceRequest;
import app.entity.RequestCategory;
import app.entity.RequestPriority;
import app.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long>, JpaSpecificationExecutor<MaintenanceRequest> {

    List<MaintenanceRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<MaintenanceRequest> findByTechnicianIdOrderByCreatedAtDesc(Long technicianId);

    List<MaintenanceRequest> findAllByOrderByCreatedAtDesc();

    List<MaintenanceRequest> findTop5ByOrderByCreatedAtDesc();

    List<MaintenanceRequest> findByPriorityInAndStatusNotOrderByCreatedAtDesc(List<RequestPriority> priorities, RequestStatus status);

    long countByStudentId(Long studentId);

    long countByStudentIdAndStatus(Long studentId, RequestStatus status);

    long countByTechnicianId(Long technicianId);

    long countByTechnicianIdAndStatus(Long technicianId, RequestStatus status);

    long countByTechnicianIdAndPriority(Long technicianId, RequestPriority priority);

    long countByStatus(RequestStatus status);

    long countByPriority(RequestPriority priority);

    long countByCategory(RequestCategory category);

    @Query("SELECT r.category, COUNT(r) FROM MaintenanceRequest r GROUP BY r.category")
    List<Object[]> countGroupByCategory();

    @Query("SELECT r.status, COUNT(r) FROM MaintenanceRequest r GROUP BY r.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT r FROM MaintenanceRequest r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:priority IS NULL OR r.priority = :priority) AND " +
           "(:search IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.location) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.student.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.student.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY r.createdAt DESC")
    List<MaintenanceRequest> filterRequests(
            @Param("status") RequestStatus status,
            @Param("category") RequestCategory category,
            @Param("priority") RequestPriority priority,
            @Param("search") String search);
}
