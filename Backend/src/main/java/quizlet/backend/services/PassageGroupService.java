package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.dto.PassageGroupDTO;
import quizlet.backend.dto.QuestionDTO;
import quizlet.backend.model.PassageGroup;
import quizlet.backend.model.Section;
import quizlet.backend.repository.PassageGroupRepository;
import quizlet.backend.repository.SectionRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PassageGroupService {

    @Autowired
    private PassageGroupRepository passageGroupRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private QuestionService questionService;

    @Transactional
    public PassageGroupDTO createPassageGroup(PassageGroupDTO dto) {
        if (dto.getSectionId() == null) {
            throw new RuntimeException("Thiếu sectionId khi tạo PassageGroup");
        }

        Section section = sectionRepository.findById(dto.getSectionId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Section với ID: " + dto.getSectionId()));

        return createPassageGroupForSection(dto, section);
    }

    @Transactional
    public PassageGroupDTO createPassageGroupForSection(PassageGroupDTO dto, Section section) {
        PassageGroup pg = new PassageGroup();
        pg.setSection(section);
        pg.setTitle(dto.getTitle() != null ? dto.getTitle() : "Passage Group");
        pg.setPassageText(dto.getPassageText());
        pg.setImageUrl(dto.getImageUrl());
        pg.setAudioUrl(dto.getAudioUrl());
        pg.setOrderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : 1);
        pg.setToeicPart(dto.getToeicPart());
        pg.setQuestions(new ArrayList<>());

        PassageGroup savedPg = passageGroupRepository.save(pg);

        List<QuestionDTO> createdQuestions = new ArrayList<>();
        if (dto.getQuestions() != null && !dto.getQuestions().isEmpty()) {
            for (QuestionDTO qDto : dto.getQuestions()) {
                qDto.setPassageGroupId(savedPg.getId());
                qDto.setSectionId(section.getId());
                createdQuestions.add(questionService.createQuestion(qDto));
            }
        }

        PassageGroupDTO result = mapToDTO(savedPg);
        result.setQuestions(createdQuestions);
        return result;
    }

    @Transactional(readOnly = true)
    public PassageGroupDTO getPassageGroupById(Long id) {
        return passageGroupRepository.findById(id).map(this::mapToDTO).orElse(null);
    }

    @Transactional
    public void deletePassageGroup(Long id) {
        passageGroupRepository.deleteById(id);
    }

    public PassageGroupDTO mapToDTO(PassageGroup pg) {
        List<QuestionDTO> qDtos = (pg.getQuestions() != null)
                ? pg.getQuestions().stream().map(questionService::mapToDTO).collect(Collectors.toList())
                : Collections.emptyList();

        return PassageGroupDTO.builder()
                .id(pg.getId())
                .sectionId(pg.getSection() != null ? pg.getSection().getId() : null)
                .title(pg.getTitle())
                .passageText(pg.getPassageText())
                .imageUrl(pg.getImageUrl())
                .audioUrl(pg.getAudioUrl())
                .orderIndex(pg.getOrderIndex())
                .toeicPart(pg.getToeicPart())
                .questions(qDtos)
                .build();
    }
}
