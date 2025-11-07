package mainProgram.repository;

import mainProgram.table.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
  List<Product> findByNameContainingIgnoreCase(String keyword);

  /**
   * Searches across multiple fields: productNumber (Varenr), name (Navn), EAN, and type.
   * Case-insensitive partial matches.
   */
  @Query(
    """
    SELECT p FROM Product p
    WHERE LOWER(p.productNumber) LIKE LOWER(CONCAT('%', :kw, '%'))
       OR LOWER(p.name) LIKE LOWER(CONCAT('%', :kw, '%'))
       OR LOWER(p.EAN) LIKE LOWER(CONCAT('%', :kw, '%'))
       OR LOWER(p.type) LIKE LOWER(CONCAT('%', :kw, '%'))
    ORDER BY p.name ASC
    """
  )
  List<Product> search(@Param("kw") String keyword);
  // Spring Data auto-provides findAll(), findById(), save(), delete(), etc.
}
