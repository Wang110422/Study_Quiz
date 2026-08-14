package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import quizlet.backend.dto.FolderDTO;
import quizlet.backend.dto.StudySetDTO;
import quizlet.backend.helper.SlugUtil;
import quizlet.backend.model.Folder;
import quizlet.backend.model.User;
import quizlet.backend.repository.FolderRepository;
import quizlet.backend.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FolderService {
    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private UserRepository userRepository;

    public List<FolderDTO> getAllByUserId(Long userId) {
        return folderRepository.findByUserId(userId)
                .stream()
                .filter(f -> f.getIsDel() == null || !f.getIsDel())
                .map(this::convertFolderDTO)
                .collect(Collectors.toList());
    }

    public List<FolderDTO> getDeletedByUserId(Long userId) {
        return folderRepository.findByUserIdAndIsDelTrue(userId)
                .stream()
                .map(this::convertFolderDTO)
                .collect(Collectors.toList());
    }

    public FolderDTO getFolderBySlug(String slug) {
        Folder folder = folderRepository.findBySlug(slug).orElse(null);
        if (folder == null || (folder.getIsDel() != null && folder.getIsDel())) return null;
        return convertFolderDTO(folder);
    }

    public FolderDTO getFolderById(Long id) {
        Folder folder = folderRepository.findById(id).orElse(null);
        if (folder == null || (folder.getIsDel() != null && folder.getIsDel())) return null;
        return convertFolderDTO(folder);
    }

    public FolderDTO createFolder(FolderDTO folderDTO, Long userId) {
        Folder folder = convertFolder(folderDTO);
        User user = userRepository.findById(userId).orElse(null);

        String slug = SlugUtil.toSlug(folder.getName());
        if (folderRepository.existsBySlug(slug)) {
            slug += "_" + System.currentTimeMillis();
        }

        folder.setSlug(slug);
        folder.setUser(user);
        folder.setIsDel(false);
        if (folder.getIcon() == null || folder.getIcon().isEmpty()) {
            folder.setIcon("📁");
        }

        return convertFolderDTO(folderRepository.save(folder));
    }

    public boolean softDeleteFolder(Long id) {
        Folder folder = folderRepository.findById(id).orElse(null);
        if (folder != null) {
            folder.setIsDel(true);
            folderRepository.save(folder);
            return true;
        }
        return false;
    }

    public boolean restoreFolder(Long id) {
        Folder folder = folderRepository.findById(id).orElse(null);
        if (folder != null) {
            folder.setIsDel(false);
            folderRepository.save(folder);
            return true;
        }
        return false;
    }

    public boolean permanentDeleteFolder(Long id) {
        if (folderRepository.existsById(id)) {
            folderRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public boolean deleteFolder(Long id) {
        return softDeleteFolder(id);
    }

    public FolderDTO convertFolderDTO(Folder folder) {
        FolderDTO dto = new FolderDTO();
        dto.setId(folder.getId());
        dto.setName(folder.getName());
        dto.setDescription(folder.getDescription());
        dto.setSlug(folder.getSlug());
        dto.setIcon(folder.getIcon());
        dto.setDriveFolderId(folder.getDriveFolderId());
        dto.setSheetUrl(folder.getSheetUrl());
        dto.setIsDel(folder.getIsDel());
        dto.setCreatedAt(folder.getCreatedAt());

        if (folder.getStudySets() != null) {
            dto.setSetsCount(folder.getStudySets().size());
            int totalTerms = folder.getStudySets().stream()
                    .mapToInt(s -> s.getVocabularies() != null ? s.getVocabularies().size() : 0)
                    .sum();
            dto.setTermsCount(totalTerms);

            List<StudySetDTO> setsDTO = folder.getStudySets().stream().map(set -> {
                StudySetDTO sDto = new StudySetDTO();
                sDto.setId(set.getId());
                sDto.setTitleName(set.getTitleName());
                sDto.setSlug(set.getSlug());
                return sDto;
            }).collect(Collectors.toList());

            dto.setStudySets(setsDTO);
        } else {
            dto.setSetsCount(0);
            dto.setTermsCount(0);
            dto.setStudySets(new ArrayList<>());
        }

        return dto;
    }

    public Folder convertFolder(FolderDTO dto) {
        Folder folder = new Folder();
        folder.setName(dto.getName());
        folder.setDescription(dto.getDescription());
        folder.setIcon(dto.getIcon());
        return folder;
    }
}
