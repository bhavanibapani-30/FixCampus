package app.repository;

import app.entity.RequestUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestUpdateRepository extends JpaRepository<RequestUpdate, Long> {
    List<RequestUpdate> findByRequestIdOrderByCreatedAtAsc(Long requestId);
    List<RequestUpdate> findByRequestIdOrderByCreatedAtDesc(Long requestId);
}
