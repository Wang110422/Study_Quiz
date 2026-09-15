// Re-export / delegate to roadmapService for backwards compatibility
import roadmapService, {
    type RoadmapDTO as StudyPathDTO,
    type RoadmapPhaseDTO,
    type PhaseTaskDTO as StudyPathItemDTO,
    type CreateRoadmapPayload as CreatePathPayload,
} from './roadmapService';

export type { StudyPathDTO, RoadmapPhaseDTO, StudyPathItemDTO, CreatePathPayload };
export default roadmapService;
