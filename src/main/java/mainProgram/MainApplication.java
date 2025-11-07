package mainProgram; // Project Organization

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/* --- MainApplication Class --- */
@SpringBootApplication // Marks this as the main Spring Boot application class
public class MainApplication {

  // Main Method: Entry point of the application
  public static void main(String[] args) {
    // Runs the Spring Boot application
    SpringApplication.run(MainApplication.class, args);
  }
}
