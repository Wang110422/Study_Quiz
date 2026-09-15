import useRoadmaps from './useRoadmaps';

export const useStudyPaths = () => {
    const {
        roadmaps,
        selectedRoadmap,
        loading,
        error,
        selectRoadmapById,
        refetch,
        createRoadmap,
        updateTaskProgress,
        deleteRoadmap,
    } = useRoadmaps();

    return {
        paths: roadmaps,
        selectedPath: selectedRoadmap,
        loading,
        error,
        selectPathById: selectRoadmapById,
        refetch,
        createPath: createRoadmap,
        updateItemProgress: updateTaskProgress,
        deletePath: deleteRoadmap,
    };
};

export default useStudyPaths;
