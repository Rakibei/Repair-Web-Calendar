package mainProgram.repository;

import mainProgram.table.JobPart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobPartRepository extends JpaRepository<JobPart, Long> {
  List<JobPart> findByJobId(int jobId);
  // Spring Data auto-provides findAll(), findById(), save(), delete(), etc.
}
