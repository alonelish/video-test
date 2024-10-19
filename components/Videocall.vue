<script setup lang="ts">
import ZoomVideo, { type VideoPlayer, VideoQuality } from "@zoom/videosdk";

const props = defineProps(['slug', 'JWT'])
const topic = props.slug;
const token = props.JWT;
const username = `User-${String(new Date().getTime()).slice(6)}`;
const client = ZoomVideo.createClient()

const videoContainer = ref(null);
const inSession = ref(false);
const audioMuted = ref(false);
const videoMuted = ref(false);

onMounted(async () => {
    await client.init("en-US", "Global", { patchJsMedia: true });
})

const startCall = async () => {
    client.on("peer-video-state-change", renderVideo);
    await client.join(topic, token, username);
    const mediaStream = client.getMediaStream();
    await mediaStream.startAudio();
    await mediaStream.startVideo()

    await renderVideo({ action: 'Start', userId: client.getCurrentUserInfo().userId });
    inSession.value = true;
    audioMuted.value = mediaStream.isAudioMuted();
    videoMuted.value = !mediaStream.isCapturingVideo();

    const commandClient = client.getCommandClient()

    commandClient.on('command-received', (payload) => {
        console.log("Command received:", payload);
    })
}

const renderVideo = async (event: { action: "Start" | "Stop"; userId: number; }) => {
    const mediaStream = client.getMediaStream();
    if (event.action === 'Stop') {
        const element = await mediaStream.detachVideo(event.userId);
        Array.isArray(element) ? element.forEach((el) => el.remove()) : element.remove();
    } else {
        const userVideo = await mediaStream.attachVideo(event.userId, VideoQuality.Video_360P);
        videoContainer.value?.appendChild(userVideo);
    }
}

const leaveCall = async () => {
    const mediaStream = client.getMediaStream();
    for (const user of client.getAllUser()) {
        const element = await mediaStream.detachVideo(user.userId);
        Array.isArray(element) ? element.forEach((el) => el.remove()) : element.remove();
    }
    client.off("peer-video-state-change", renderVideo);
    await client.leave();
    inSession.value = false;
}

function sendCustomData(data: string) {
    const commandClient = client.getCommandClient()

    const commandPayload = JSON.stringify(data);  // Convert the command to JSON

    // Send the custom command
    commandClient.send(commandPayload)
        .then(() => {
            console.log('Command sent successfully:', commandPayload);
        })
        .catch(error => {
            console.error('Error sending command:', error);
        });

}
const toggleVideo = async () => {
    const mediaStream = client.getMediaStream();
    if (mediaStream.isCapturingVideo()) {
        await mediaStream.stopVideo();
        await renderVideo({ action: 'Stop', userId: client.getCurrentUserInfo().userId });
    } else {
        await mediaStream.startVideo();
        await renderVideo({ action: 'Start', userId: client.getCurrentUserInfo().userId });
    }
    videoMuted.value = !mediaStream.isCapturingVideo();
};

const toggleAudio = async () => {
    const mediaStream = client.getMediaStream();
    if (client.getCurrentUserInfo().muted) {
        await mediaStream.unmuteAudio();
    } else {
        await mediaStream.muteAudio();
    }
    audioMuted.value = mediaStream.isAudioMuted();
};
</script>

<template>
    <div>
        <div v-show="inSession">
            <video-player-container ref="videoContainer"></video-player-container>
        </div>

        <div v-if="!inSession">
            <button @click="startCall">
                Join
            </button>
        </div>
        <div v-if="inSession">
            <button @click="toggleVideo">
                <p v-if="videoMuted">Unmute Video</p>
                <p v-else>Mute Video</p>
            </button>
            <button @click="toggleAudio">
                <p v-if="audioMuted">Unmute Audio</p>
                <p v-else>Mute Audio</p>
            </button>
            <button @click="sendCustomData('Bla Blas')">
                Send Data
            </button>
            <button @click="leaveCall">
                <p>Leave</p>
            </button>
        </div>
    </div>
</template>