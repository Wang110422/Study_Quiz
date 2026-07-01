package quizlet.backend.helper;
import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class SlugUtil {
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public static String toSlug(String text) {
        if(text == null || text.isEmpty()) {
            return "";
        }
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        String noAccent = normalized.replaceAll("\\p{M}", "");

        // 2. Sửa thủ công chữ Đ viết hoa và đ viết thường (Hàm Normalize chuẩn không xóa được chữ Đ)
        noAccent = noAccent.replace("Đ", "D").replace("đ", "d");

        // 3. Thay thế khoảng trắng thành dấu gạch ngang
        String nowhitespace = WHITESPACE.matcher(noAccent).replaceAll("-");

        // 4. Xóa bỏ các ký tự đặc biệt (icon, dấu chấm, phẩy, emoji...) và chuyển về chữ thường
        String slug = NONLATIN.matcher(nowhitespace).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
