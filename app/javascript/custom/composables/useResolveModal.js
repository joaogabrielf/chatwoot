import { computed, ref } from 'vue';
import { useStoreGetters } from 'dashboard/composables/store';

export const useResolveModal = () => {
  const getters = useStoreGetters();
  const isResolveModalOpen = ref(false);

  const selectedChatHasResolveReason = computed(
    () => getters.getSelectedChat.value.custom_attributes.motivo_encerramento
  );

  const openResolveModal = () => {
    isResolveModalOpen.value = true;
  };
  const hideResolveModal = () => {
    isResolveModalOpen.value = false;
  };

  const checkIfConversationHasResolveReason = resolveCallback => {
    if (!selectedChatHasResolveReason.value) {
      openResolveModal();
    } else {
      resolveCallback();
    }
  };

  return {
    selectedChatHasResolveReason,
    isResolveModalOpen,
    openResolveModal,
    hideResolveModal,
    checkIfConversationHasResolveReason,
  };
};
