package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.dto.PassageGroupDTO;
import quizlet.backend.dto.SectionDTO;
import quizlet.backend.enums.SkillType;
import quizlet.backend.model.Exam;
import quizlet.backend.model.Section;
import quizlet.backend.repository.ExamRepository;
import quizlet.backend.repository.SectionRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SectionService {

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private PassageGroupService passageGroupService;

    @Transactional
    public SectionDTO createSection(SectionDTO dto) {
        if (dto.getExamId() == null) {
            throw new RuntimeException("Thiếu examId khi tạo Section");
        }

        Exam exam = examRepository.findById(dto.getExamId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Exam với ID: " + dto.getExamId()));

        return createSectionForExam(dto, exam);
    }

    @Transactional
    public SectionDTO createSectionForExam(SectionDTO dto, Exam exam) {
        Section section = new Section();
        section.setExam(exam);
        section.setTitle(dto.getTitle() != null ? dto.getTitle() : "Section");
        section.setSkill(dto.getSkill() != null ? dto.getSkill() : SkillType.LISTENING);
        section.setOrderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : 1);
        section.setPassageGroups(new ArrayList<>());

        Section savedSection = sectionRepository.save(section);

        List<PassageGroupDTO> createdPassageGroups = new ArrayList<>();
        if (dto.getPassageGroups() != null && !dto.getPassageGroups().isEmpty()) {
            for (PassageGroupDTO pgDto : dto.getPassageGroups()) {
                pgDto.setSectionId(savedSection.getId());
                createdPassageGroups.add(passageGroupService.createPassageGroupForSection(pgDto, savedSection));
            }
        }

        int totalQ = createdPassageGroups.stream()
                .mapToInt(pg -> pg.getQuestions() != null ? pg.getQuestions().size() : 0)
                .sum();

        return SectionDTO.builder()
                .id(savedSection.getId())
                .examId(exam.getId())
                .title(savedSection.getTitle())
                .skill(savedSection.getSkill())
                .orderIndex(savedSection.getOrderIndex())
                .questionCount(totalQ)
                .passageGroups(createdPassageGroups)
                .build();
    }

    @Transactional(readOnly = true)
    public SectionDTO getSectionById(Integer id) {
        return sectionRepository.findById(id).map(this::mapToDTO).orElse(null);
    }

    @Transactional
    public void deleteSection(Integer id) {
        sectionRepository.deleteById(id);
    }

    public SectionDTO mapToDTO(Section s) {
        List<PassageGroupDTO> pgDtos = (s.getPassageGroups() != null)
                ? s.getPassageGroups().stream().map(passageGroupService::mapToDTO).collect(Collectors.toList())
                : Collections.emptyList();

        int totalQ = pgDtos.stream()
                .mapToInt(pg -> pg.getQuestions() != null ? pg.getQuestions().size() : 0)
                .sum();

        return SectionDTO.builder()
                .id(s.getId())
                .examId(s.getExam() != null ? s.getExam().getId() : null)
                .title(s.getTitle())
                .skill(s.getSkill())
                .orderIndex(s.getOrderIndex())
                .questionCount(totalQ)
                .passageGroups(pgDtos)
                .build();
    }
}
