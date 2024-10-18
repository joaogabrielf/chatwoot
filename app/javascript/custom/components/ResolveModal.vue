<script setup>
import { ref, computed } from 'vue';
import { required } from '@vuelidate/validators';
import { useStoreGetters, useStore } from 'dashboard/composables/store';
import { useVuelidate } from '@vuelidate/core';
import { useAlert } from 'dashboard/composables';

const props = defineProps({
  onClose: {
    type: Function,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['resolve']);

const showModal = ref(true);
const resolveReason = ref(0);

const store = useStore();
const getters = useStoreGetters();

const currentChat = computed(() => getters.getSelectedChat.value);

const attributes = computed(() =>
  getters['attributes/getAttributesByModel'].value('conversation_attribute')
);

const resolveAttributes = computed(() => {
  const mappedAttr = attributes.value
    .filter(attr => attr.attribute_key === 'motivo_encerramento')[0]
    .attribute_values.map((value, index) => ({
      id: index,
      option: value,
    }));

  return mappedAttr;
});

const rules = {
  resolveReason: { required },
};

const v$ = useVuelidate(rules, {
  resolveReason,
});

const isSubmitButtonDisabled = computed(() => v$.value.resolveReason.$invalid);

const addResolveReasonForCurrentChat = async () => {
  v$.value.$touch();
  if (v$.value.$invalid) {
    return;
  }
  // const updatedAttributes = { ...customAttributes.value, [key]: value };
  const updatedAttributes = {
    motivo_encerramento: resolveAttributes.value[resolveReason.value].option,
  };

  try {
    await store.dispatch('updateCustomAttributes', {
      conversationId: currentChat.value.id,
      customAttributes: updatedAttributes,
    });
    props.onClose();
  } catch (error) {
    useAlert(error);
  } finally {
    emit('resolve');
    useAlert('Motivo de encerramento adicionado com sucesso');
  }
};

const addResolveReasonForSelectedConversations = async () => {
  v$.value.$touch();
  if (v$.value.$invalid) {
    return;
  }
  const selectedConversations =
    getters['bulkActions/getSelectedConversationIds'];
  const updatedAttributes = {
    motivo_encerramento: resolveAttributes.value[resolveReason.value].option,
  };

  try {
    await store.dispatch('bulkActions/process', {
      type: 'Conversation',
      ids: selectedConversations.value,
      fields: {
        custom_attributes: updatedAttributes,
      },
      snoozed_until: null,
    });
  } catch (error) {
    useAlert(error);
  } finally {
    useAlert('Motivo de encerramento adicionado com sucesso');
    emit('resolve');
    props.onClose();
  }
};

const addResolveReason = props.multiple
  ? addResolveReasonForSelectedConversations
  : addResolveReasonForCurrentChat;
</script>

<!-- eslint-disable vue/no-bare-strings-in-template -->
<template>
  <woot-modal v-model:show="showModal" :on-close="onClose">
    <div class="flex flex-col h-auto overflow-auto">
      <woot-modal-header
        header-title="Deseja realmente fechar o atendimento?"
      />
      <form class="flex flex-col w-full" @submit.prevent="addResolveReason">
        <label :class="{ error: v$.resolveReason.$error }">
          Selecione o motivo do encerramento abaixo:
          <select v-model="resolveReason">
            <option
              v-for="attr in resolveAttributes"
              :key="attr.id"
              :value="attr.id"
            >
              {{ attr.option }}
            </option>
          </select>
          <span v-if="v$.resolveReason.$error" class="message"> Erro </span>
        </label>

        <div class="flex flex-row justify-end w-full gap-2 px-0 py-2">
          <woot-submit-button
            :disabled="isSubmitButtonDisabled"
            button-text="Encerrar"
          />
          <button class="button clear" @click.prevent="onClose">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </woot-modal>
</template>
