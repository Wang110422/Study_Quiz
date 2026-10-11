package quizlet.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ApplicationTests {

	static {
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
		dotenv.entries().forEach(entry -> {
			System.setProperty(entry.getKey(), entry.getValue());
		});
		if (System.getProperty("DB_URL") == null) {
			System.setProperty("DB_URL", "jdbc:mysql://localhost:3306/quizlet_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true");
		}
		if (System.getProperty("DB_USER") == null) {
			System.setProperty("DB_USER", "root");
		}
		if (System.getProperty("DB_PASSWORD") == null) {
			System.setProperty("DB_PASSWORD", "123456");
		}
		if (System.getProperty("JWT_SECRET") == null) {
			System.setProperty("JWT_SECRET", "default_jwt_secret_key_for_testing_purposes_only_at_least_32_bytes_long");
		}
		if (System.getProperty("GOOGLE_CLIENT_ID") == null) {
			System.setProperty("GOOGLE_CLIENT_ID", "test-google-client-id");
		}
		if (System.getProperty("GOOGLE_CLIENT_SECRET") == null) {
			System.setProperty("GOOGLE_CLIENT_SECRET", "test-google-client-secret");
		}
	}

	@Test
	void contextLoads() {
	}

}
