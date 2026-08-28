package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.dto.QuestionDTO;
import quizlet.backend.model.PassageGroup;
import quizlet.backend.model.Question;
import quizlet.backend.model.Section;
import quizlet.backend.repository.PassageGroupRepository;
import quizlet.backend.repository.QuestionRepository;
import quizlet.backend.repository.SectionRepository;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private PassageGroupRepository passageGroupRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Transactional
    public QuestionDTO createQuestion(QuestionDTO dto) {
        PassageGroup pg = null;
        if (dto.getPassageGroupId() != null) {
            pg = passageGroupRepository.findById(dto.getPassageGroupId()).orElse(null);
        }

        Section section = null;
        if (pg != null) {
            section = pg.getSection();
        } else if (dto.getSectionId() != null) {
            section = sectionRepository.findById(dto.getSectionId()).orElse(null);
        }

        if (section == null) {
            throw new RuntimeException("Phải cung cấp passageGroupId hoặc sectionId hợp lệ cho câu hỏi");
        }

        Question q = new Question();
        q.setPassageGroup(pg);
        q.setSection(section);
        q.setContent(dto.getContent());
        q.setAnswer(dto.getAnswer());
        q.setCorrectAnswer(dto.getCorrectAnswer());
        q.setExplanation(dto.getExplanation());
        q.setScore(dto.getScore() != null ? dto.getScore() : 5.0);
        q.setOrderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : 1);

        Question saved = questionRepository.save(q);
        return mapToDTO(saved);
    }

    @Transactional
    public List<QuestionDTO> createQuestionsBulk(List<QuestionDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) return Collections.emptyList();
        return dtos.stream().map(this::createQuestion).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuestionDTO getQuestionById(Long id) {
        return questionRepository.findById(id).map(this::mapToDTO).orElse(null);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    public QuestionDTO mapToDTO(Question q) {
        return QuestionDTO.builder()
                .id(q.getId())
                .passageGroupId(q.getPassageGroup() != null ? q.getPassageGroup().getId() : null)
                .sectionId(q.getSection() != null ? q.getSection().getId() : null)
                .content(q.getContent())
                .answer(q.getAnswer())
                .correctAnswer(q.getCorrectAnswer())
                .explanation(q.getExplanation())
                .score(q.getScore())
                .orderIndex(q.getOrderIndex())
                .build();
    }
}
