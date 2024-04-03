<script setup lang="ts">
  const props = defineProps({
    profilePicture: { type: String, required: true }
  })
</script>

<template>
  <div class="avatar">
    <div>
      <div class="frame">
        <img v-if="props.profilePicture" :src="props.profilePicture" alt="avatar" height="45" />
        <img v-else src="/user.png" alt="profile placeholder" height="45" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .avatar {
    .frame {
      width: 45px;
      height: 45px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      border-radius: 50%;
    }

    img {
      width: 100%;
    }
  }
</style>
