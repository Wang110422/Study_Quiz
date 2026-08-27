package quizlet.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.enums.*;
import quizlet.backend.model.*;
import quizlet.backend.repository.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private GrammarSetRepository grammarSetRepository;

    @Autowired
    private StudySetRepository studySetRepository;

    @Autowired
    private VocabularyRepository vocabularyRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private PassageGroupRepository passageGroupRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE exam_attempt MODIFY COLUMN mode VARCHAR(50) NOT NULL");
        } catch (Exception e) {
            System.out.println("Could not alter exam_attempt mode column: " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE exam_attempt MODIFY COLUMN user_id BIGINT NULL");
        } catch (Exception e) {
            System.out.println("Could not alter exam_attempt user_id column: " + e.getMessage());
        }

        seedGrammarSets();
        seedStudySets();
        seedPracticeExams();
        seedMockTests();
    }

    private void seedGrammarSets() {
        if (grammarSetRepository.count() > 0) return;

        // 1. Bộ 12 Thì
        GrammarSet g1 = new GrammarSet();
        g1.setTilte("12 Thì Tiếng Anh & Ứng dụng Thực chiến");
        g1.setDescription("Nắm chắc bản chất, cấu trúc, dấu hiệu phân biệt và cách dùng 12 thì trong bài thi.");
        g1.setSlug("12-thi-tieng-anh-thuc-chien");
        g1.setIsDel(false);
        g1.setGrammars(new ArrayList<>());

        Grammar gm1 = new Grammar();
        gm1.setTitle("Hiện tại đơn (Simple Present)");
        gm1.setStructure("S + V(s/es) + O | S + do/does not + V_inf");
        gm1.setExplanation("Diễn tả chân lý, sự thật hiển nhiên, thói quen lặp đi lặp lại hoặc lịch trình cố định.");
        gm1.setExample("The sun rises in the east. She works in a bank.");
        gm1.setDescription("Dấu hiệu: always, usually, often, every day/week.");
        gm1.setGrammarSet(g1);
        g1.getGrammars().add(gm1);

        Grammar gm2 = new Grammar();
        gm2.setTitle("Hiện tại hoàn thành (Present Perfect)");
        gm2.setStructure("S + have/has + V3/ed + O");
        gm2.setExplanation("Diễn tả hành động xảy ra trong quá khứ kéo dài đến hiện tại hoặc kết quả còn lưu lại.");
        gm2.setExample("I have lived in Hanoi for 5 years.");
        gm2.setDescription("Dấu hiệu: since, for, already, yet, just, recently.");
        gm2.setGrammarSet(g1);
        g1.getGrammars().add(gm2);

        grammarSetRepository.save(g1);

        // 2. Mệnh đề quan hệ
        GrammarSet g2 = new GrammarSet();
        g2.setTilte("Mệnh đề Quan hệ & Mệnh đề Rút gọn");
        g2.setDescription("Bí quyết viết câu phức linh hoạt, xử lý nhanh các câu hỏi ngữ pháp khó trong TOEIC & IELTS.");
        g2.setSlug("menh-de-quan-he-va-rut-gon");
        g2.setIsDel(false);
        g2.setGrammars(new ArrayList<>());

        Grammar gm3 = new Grammar();
        gm3.setTitle("Đại từ quan hệ Who, Whom, Which, That");
        gm3.setStructure("Who (người - chủ từ), Whom (người - túc từ), Which (vật), That (thay thế cho who/which)");
        gm3.setExplanation("Dùng để nối hai mệnh đề có chung danh từ nhằm tránh lặp từ.");
        gm3.setExample("The man who called you yesterday is my manager.");
        gm3.setDescription("Lưu ý: Không dùng 'that' sau dấu phẩy (mệnh đề quan hệ không xác định).");
        gm3.setGrammarSet(g2);
        g2.getGrammars().add(gm3);

        grammarSetRepository.save(g2);

        // 3. Câu điều kiện
        GrammarSet g3 = new GrammarSet();
        g3.setTilte("Câu Điều kiện Loại 1, 2, 3 & Đảo ngữ");
        g3.setDescription("Tổng hợp toàn bộ các dạng câu điều kiện giả định và cấu trúc đảo ngữ ghi điểm cao.");
        g3.setSlug("cau-dieu-kien-va-dao-ngu");
        g3.setIsDel(false);
        g3.setGrammars(new ArrayList<>());
        grammarSetRepository.save(g3);

        // 4. Câu bị động
        GrammarSet g4 = new GrammarSet();
        g4.setTilte("Câu Bị động Đặc biệt & Thể Sai khiến");
        g4.setDescription("Cấu trúc câu bị động nâng cao trong các văn bản học thuật, báo cáo và hợp đồng thương mại.");
        g4.setSlug("cau-bi-dong-dac-biet");
        g4.setIsDel(false);
        g4.setGrammars(new ArrayList<>());
        grammarSetRepository.save(g4);
    }

    private void seedStudySets() {
        if (studySetRepository.count() > 0) return;

        StudySet s1 = new StudySet();
        s1.setTitleName("300 Từ vựng IELTS Academic Band 7.0+");
        s1.setDescription("Từ vựng học thuật cốt lõi thường gặp nhất trong các bài thi Viết và Đọc hiểu.");
        s1.setSlug("300-tu-vung-ielts-academic-band-7");
        s1.setIsDel(false);
        s1.setVocabularies(new ArrayList<>());

        Vocabulary v1 = new Vocabulary();
        v1.setTerm("Phenomenon");
        v1.setDefinition("Hiện tượng, sự việc phi thường có thể quan sát được");
        v1.setPos(Pos.NOUN);
        v1.setLevel(Level.B2);
        v1.setMeaning("A fact or situation that is observed to exist or happen.");
        v1.setHint("Climate change is a complex global phenomenon.");
        v1.setStudySet(s1);
        s1.getVocabularies().add(v1);

        Vocabulary v2 = new Vocabulary();
        v2.setTerm("Substantial");
        v2.setDefinition("Đáng kể, quan trọng, có giá trị lớn");
        v2.setPos(Pos.ADJECTIVE);
        v2.setLevel(Level.C1);
        v2.setMeaning("Of considerable importance, size, or worth.");
        v2.setHint("There has been a substantial increase in online learning.");
        v2.setStudySet(s1);
        s1.getVocabularies().add(v2);

        studySetRepository.save(s1);

        StudySet s2 = new StudySet();
        s2.setTitleName("TOEIC Part 5 & 6 Business Vocabulary");
        s2.setDescription("Từ vựng môi trường văn phòng, hợp đồng, tài chính, logistics và nhân sự.");
        s2.setSlug("toeic-business-vocabulary-650");
        s2.setIsDel(false);
        s2.setVocabularies(new ArrayList<>());
        studySetRepository.save(s2);

        StudySet s3 = new StudySet();
        s3.setTitleName("Từ vựng Chủ đề Môi trường & Khí hậu");
        s3.setDescription("Thuật ngữ chuyên ngành sinh thái, năng lượng tái tạo và phát triển bền vững.");
        s3.setSlug("tu-vung-moi-truong-khi-hau");
        s3.setIsDel(false);
        s3.setVocabularies(new ArrayList<>());
        studySetRepository.save(s3);
    }

    private void seedPracticeExams() {
        if (examRepository.findByType(ExamType.PRACTICE).size() > 0) return;

        // 1. Đề Luyện Nghe TOEIC Part 1
        Exam p1 = new Exam();
        p1.setTitle("TOEIC Listening Part 1 - Mô tả Tranh Thực chiến (Test 01)");
        p1.setTotalMinutes(10);
        p1.setTotalScore(30);
        p1.setType(ExamType.PRACTICE);
        p1.setCreatedAt(LocalDateTime.now());
        p1.setSections(new ArrayList<>());

        Section sec1 = new Section();
        sec1.setTitle("Listening Part 1 (Photographs)");
        sec1.setSkill(SkillType.LISTENING);
        sec1.setOrderIndex(1);
        sec1.setExam(p1);
        sec1.setPassageGroups(new ArrayList<>());

        for (int i = 1; i <= 6; i++) {
            PassageGroup pg = new PassageGroup();
            pg.setTitle("Câu hỏi hình ảnh #" + i);
            pg.setMediaUrl("/assets/login-hero.jpg");
            pg.setOrderIndex(i);
            pg.setToeicPart(ToeicPart.PART_1);
            pg.setSection(sec1);
            pg.setQuestions(new ArrayList<>());

            Question q = new Question();
            q.setContent("Look at the picture and choose the statement that best describes what you see:");
            q.setAnswer("[\"(A) A man is working on a laptop.\", \"(B) A man is reaching for glowing flashcards.\", \"(C) The library is completely empty.\", \"(D) People are walking outdoors.\"]");
            q.setCorrectAnswer("(B) A man is reaching for glowing flashcards.");
            q.setExplanation("Trong bức tranh, người thanh niên đang giơ ngón tay chỉ về phía các thẻ từ vựng phát sáng trên trang sách.");
            q.setScore(5.0);
            q.setOrderIndex(1);
            q.setSection(sec1);
            q.setPassageGroup(pg);
            pg.getQuestions().add(q);

            sec1.getPassageGroups().add(pg);
        }
        p1.getSections().add(sec1);
        examRepository.save(p1);

        // 2. Đề Luyện Nghe TOEIC Part 3
        Exam p3 = new Exam();
        p3.setTitle("TOEIC Listening Part 3 - Hội thoại Đoạn ngắn (Conversations)");
        p3.setTotalMinutes(30);
        p3.setTotalScore(100);
        p3.setType(ExamType.PRACTICE);
        p3.setCreatedAt(LocalDateTime.now());
        p3.setSections(new ArrayList<>());

        Section sec3 = new Section();
        sec3.setTitle("Listening Part 3 (Conversations)");
        sec3.setSkill(SkillType.LISTENING);
        sec3.setOrderIndex(1);
        sec3.setExam(p3);
        sec3.setPassageGroups(new ArrayList<>());

        for (int g = 1; g <= 3; g++) {
            PassageGroup pg = new PassageGroup();
            pg.setTitle("Đoạn hội thoại #" + g + " (Questions " + ((g - 1) * 3 + 32) + "-" + (g * 3 + 31) + ")");
            pg.setPassageText("M-Cn: Hi Sarah, have you finished the quarterly budget report yet?\nW-Br: Not quite, Mark. I am still waiting for the sales figures from the Asian branch.\nM-Cn: I see. Let's schedule the project review meeting for Thursday afternoon instead.");
            pg.setOrderIndex(g);
            pg.setToeicPart(ToeicPart.PART_3);
            pg.setSection(sec3);
            pg.setQuestions(new ArrayList<>());

            for (int qIdx = 1; qIdx <= 3; qIdx++) {
                Question q = new Question();
                if (qIdx == 1) {
                    q.setContent("What is the woman working on?");
                    q.setAnswer("[\"(A) A financial budget report\", \"(B) An advertising campaign\", \"(C) A hiring interview\", \"(D) Travel arrangements\"]");
                    q.setCorrectAnswer("(A) A financial budget report");
                    q.setExplanation("Người phụ nữ nói 'Not quite, Mark. I am still waiting for the quarterly budget report'.");
                } else if (qIdx == 2) {
                    q.setContent("What is causing the delay?");
                    q.setAnswer("[\"(A) A computer error\", \"(B) Missing sales data\", \"(C) A sick colleague\", \"(D) Bad weather\"]");
                    q.setCorrectAnswer("(B) Missing sales data");
                    q.setExplanation("Cô ấy nói: 'I am still waiting for the sales figures from the Asian branch'.");
                } else {
                    q.setContent("What does the man suggest doing?");
                    q.setAnswer("[\"(A) Canceling the project\", \"(B) Rescheduling a meeting to Thursday\", \"(C) Hiring more staff\", \"(D) Calling the client\"]");
                    q.setCorrectAnswer("(B) Rescheduling a meeting to Thursday");
                    q.setExplanation("Người nam đề xuất: 'Let\\'s schedule the project review meeting for Thursday afternoon instead'.");
                }
                q.setScore(5.0);
                q.setOrderIndex(qIdx);
                q.setSection(sec3);
                q.setPassageGroup(pg);
                pg.getQuestions().add(q);
            }
            sec3.getPassageGroups().add(pg);
        }
        p3.getSections().add(sec3);
        examRepository.save(p3);

        // 3. Đề Luyện Đọc TOEIC Part 5 & 7
        Exam p5 = new Exam();
        p5.setTitle("TOEIC Reading Part 5 & 7 - Đọc hiểu & Hoàn thành câu");
        p5.setTotalMinutes(45);
        p5.setTotalScore(100);
        p5.setType(ExamType.PRACTICE);
        p5.setCreatedAt(LocalDateTime.now());
        p5.setSections(new ArrayList<>());

        Section sec5 = new Section();
        sec5.setTitle("Reading Part 5 & 7");
        sec5.setSkill(SkillType.READING);
        sec5.setOrderIndex(1);
        sec5.setExam(p5);
        sec5.setPassageGroups(new ArrayList<>());

        PassageGroup pgReading = new PassageGroup();
        pgReading.setTitle("Đoạn văn Thông báo tuyển dụng & Chính sách công ty");
        pgReading.setPassageText("MEMORANDUM\nTo: All Employees\nFrom: HR Department\nDate: August 25\nSubject: Annual Health Checkup\n\nPlease be reminded that our annual health screening will take place next Monday from 9:00 AM to 4:00 PM in Conference Room B. Fasting for at least 8 hours prior to blood testing is mandatory.");
        pgReading.setOrderIndex(1);
        pgReading.setToeicPart(ToeicPart.PART_7);
        pgReading.setSection(sec5);
        pgReading.setQuestions(new ArrayList<>());

        Question qr1 = new Question();
        qr1.setContent("What is the purpose of this memorandum?");
        qr1.setAnswer("[\"(A) To announce a new HR director\", \"(B) To inform employees about the annual health checkup\", \"(C) To cancel a meeting in Conference Room B\", \"(D) To recruit new doctors\"]");
        qr1.setCorrectAnswer("(B) To inform employees about the annual health checkup");
        qr1.setExplanation("Tiêu đề và nội dung thông báo về lịch khám sức khỏe định kỳ hàng năm.");
        qr1.setScore(5.0);
        qr1.setOrderIndex(1);
        qr1.setSection(sec5);
        qr1.setPassageGroup(pgReading);
        pgReading.getQuestions().add(qr1);

        sec5.getPassageGroups().add(pgReading);
        p5.getSections().add(sec5);
        examRepository.save(p5);
    }

    private void seedMockTests() {
        if (examRepository.findByType(ExamType.FULL_TEST).size() > 0) return;

        // 1. Đề Full Aptis Mock Test 1
        Exam aptis = new Exam();
        aptis.setTitle("Full Aptis Mock Test 1");
        aptis.setTotalMinutes(192);
        aptis.setTotalScore(200);
        aptis.setType(ExamType.FULL_TEST);
        aptis.setCreatedAt(LocalDateTime.now());
        aptis.setSections(new ArrayList<>());

        // Section 1: Speaking
        Section s1 = new Section();
        s1.setTitle("Speaking");
        s1.setSkill(SkillType.SPEAKING);
        s1.setOrderIndex(1);
        s1.setExam(aptis);
        aptis.getSections().add(s1);

        // Section 2: Listening
        Section s2 = new Section();
        s2.setTitle("Listening");
        s2.setSkill(SkillType.LISTENING);
        s2.setOrderIndex(2);
        s2.setExam(aptis);
        aptis.getSections().add(s2);

        // Section 3: Grammar & Vocabulary
        Section s3 = new Section();
        s3.setTitle("Grammar & Vocabulary");
        s3.setSkill(SkillType.GRAMMAR);
        s3.setOrderIndex(3);
        s3.setExam(aptis);
        aptis.getSections().add(s3);

        // Section 4: Reading
        Section s4 = new Section();
        s4.setTitle("Reading");
        s4.setSkill(SkillType.READING);
        s4.setOrderIndex(4);
        s4.setExam(aptis);
        aptis.getSections().add(s4);

        // Section 5: Writing
        Section s5 = new Section();
        s5.setTitle("Writing");
        s5.setSkill(SkillType.WRITING);
        s5.setOrderIndex(5);
        s5.setExam(aptis);
        aptis.getSections().add(s5);

        examRepository.save(aptis);

        // 2. Đề TOEIC Full 2 Kỹ Năng
        Exam toeic = new Exam();
        toeic.setTitle("TOEIC Full Practice Test - ETS Format #1");
        toeic.setTotalMinutes(120);
        toeic.setTotalScore(990);
        toeic.setType(ExamType.FULL_TEST);
        toeic.setCreatedAt(LocalDateTime.now());
        toeic.setSections(new ArrayList<>());

        Section st1 = new Section();
        st1.setTitle("Listening Section (Part 1 - 4)");
        st1.setSkill(SkillType.LISTENING);
        st1.setOrderIndex(1);
        st1.setExam(toeic);
        toeic.getSections().add(st1);

        Section st2 = new Section();
        st2.setTitle("Reading Section (Part 5 - 7)");
        st2.setSkill(SkillType.READING);
        st2.setOrderIndex(2);
        st2.setExam(toeic);
        toeic.getSections().add(st2);

        examRepository.save(toeic);
    }
}
