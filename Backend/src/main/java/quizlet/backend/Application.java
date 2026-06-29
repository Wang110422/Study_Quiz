package quizlet.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class}) // Thêm thuộc tính exclude ở đây
public class Application {

	public static void main(String[] args) {
	SpringApplication.run(Application.class, args);
	}

}
