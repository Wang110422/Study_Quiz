package quizlet.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map URL /media/audio/** trực tiếp vào thư mục D:\Wang\English\Toeic\Audio\
        registry.addResourceHandler("/media/audio/**")
                .addResourceLocations(
                        "file:///D:/Wang/English/Toeic/Audio/",
                        "file:D:/Wang/English/Toeic/Audio/",
                        "file:///D:/Wang/English/Toeic/Listening/Audio/",
                        "file:D:/Wang/English/Toeic/Listening/Audio/"
                );

        // Map URL /media/image/** trực tiếp vào thư mục D:\Wang\English\Toeic\Image\
        registry.addResourceHandler("/media/image/**")
                .addResourceLocations(
                        "file:///D:/Wang/English/Toeic/Image/",
                        "file:D:/Wang/English/Toeic/Image/",
                        "file:///D:/Wang/English/Toeic/Listening/Image/",
                        "file:D:/Wang/English/Toeic/Listening/Image/"
                );
    }
}
