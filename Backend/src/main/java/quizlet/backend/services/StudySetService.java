package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import quizlet.backend.dto.StudySetDTO;
import quizlet.backend.helper.SlugUtil;
import quizlet.backend.model.StudySet;
import quizlet.backend.repository.StudySetRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudySetService {
    @Autowired
    private StudySetRepository studySetRepository;

    public List<StudySetDTO> getAll() {
        return studySetRepository.findAll()
                .stream()
                .map(x -> {
                    StudySetDTO studySetDTO = new StudySetDTO();
                    studySetDTO.setTitleName(x.getTitleName());
                    studySetDTO.setSlug(x.getSlug());
                    studySetDTO.setId(x.getId());
                    return studySetDTO;
                })
                .collect(Collectors.toList());
    }

    public StudySetDTO createStudySet(StudySetDTO studySetDTO){
        StudySet studySet =  convertStudySet(studySetDTO);
        String slug = SlugUtil.toSlug(studySet.getTitleName());
        if (studySetRepository.existsBySlug(slug)){
            slug += "_" + System.currentTimeMillis();
        }
        studySet.setSlug(slug);
        return convertStudySetDTO(studySetRepository.save(studySet));
    }

    public StudySetDTO convertStudySetDTO(StudySet studySet){
        StudySetDTO studySetDTO = new StudySetDTO();
        studySetDTO.setTitleName(studySet.getTitleName());
        studySetDTO.setSlug(studySet.getSlug());
        studySetDTO.setId(studySet.getId());
        return  studySetDTO;
    }

    public StudySet convertStudySet(StudySetDTO studySetDTO){
        StudySet studySet = new StudySet();
        studySet.setTitleName(studySetDTO.getTitleName());
        studySet.setDescription("");
        return studySet;
    }
}
