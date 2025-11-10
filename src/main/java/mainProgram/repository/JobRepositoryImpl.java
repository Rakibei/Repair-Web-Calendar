package mainProgram.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;
import mainProgram.table.Job;
import org.springframework.stereotype.Repository;

@Repository
public class JobRepositoryImpl implements SearchableRepository<Job> {

  @PersistenceContext
  private EntityManager entityManager;

  @Override
  public List<Job> search(String keyword) {
    if (keyword == null || keyword.isBlank()) {
      return List.of();
    }

    String jpql = """
            SELECT j FROM Job j
            LEFT JOIN j.status s
            WHERE LOWER(j.title) LIKE LOWER(CONCAT('%', :kw, '%'))
               OR LOWER(j.job_description) LIKE LOWER(CONCAT('%', :kw, '%'))
               OR LOWER(j.customer_name) LIKE LOWER(CONCAT('%', :kw, '%'))
               OR LOWER(j.customer_phone) LIKE LOWER(CONCAT('%', :kw, '%'))
               OR j.id = :id
            ORDER BY j.date ASC
      """;

    TypedQuery<Job> query = entityManager.createQuery(jpql, Job.class);
    query.setParameter("kw", keyword);

    // Try to parse keyword to Long for id search
    Integer id = null;
    try {
      id = Integer.valueOf(keyword);
    } catch (NumberFormatException ignored) {
      // keyword is not a number, ignore id search
    }
    query.setParameter("id", id);

    return query.getResultList();
  }
}
