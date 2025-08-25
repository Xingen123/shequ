<template>
    <footer>
        <div class="es-bg-bottom">
            <div class="es-bg-bottom-btn"  @click="goHome"></div>
        </div>
        <div class="es-bg-right">
            <div class="es-bg-right-btn" @click="hideRight"></div>
        </div>
        <div class="es-bg-left">
            <div   class="es-bg-left-btn"  @click="hideLeft"></div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import { useScreenStore } from '@/store'


const store = useScreenStore()
const router = useRouter();
const goHome = ()=> {
	router.push('/home')
}
const hideRight = ()=> {
	store.setIsShowRight(!store.isShowRight)
    store.setIsShowLeft(!store.isShowLeft)
}
const hideLeft = ()=> {
    store.setIsShowRight(!store.isShowRight)
    store.setIsShowLeft(!store.isShowLeft)
}

</script>

<style lang="scss" scoped>
    .es-bg-bottom{
        position: fixed;
        width: 100%;
        height: 36px;
        bottom: 0px;
        animation: fade 3s;
        z-index: 100;
        background: url('@/assets/images/bottom-bg.png') no-repeat;
        background-size: 100% 100%;
        display: flex;
        justify-content: center;
        .es-bg-bottom-btn{
                position: relative;
                z-index: 11;
                width: 20px;
                height: 20px;
                margin-top:10px;
                background: url('@/assets/images/go.png') no-repeat;
                background-size: 100% 100%;
                cursor: pointer;
                transition: all 0.4s;
        }
        .es-bg-bottom-btn:hover{
            transform: scale(2.5);
        }
        }
        .es-bg-right{
        position: fixed;
        width: 40px;
        height: 100%;
        top: 0px;
        right: 0px;
        animation: fade 3s;
        z-index: 1;
        background: url('@/assets/images/right-bg.png') no-repeat;
        background-size: 100% 100%;
        .es-bg-right-btn{
        width: 8px;
        height: 200px;
        margin-top: 287px;
        margin-left: 20px;
        background: url('@/assets/images/rightbtn.png') no-repeat;
        background-size: 100% 100%;
        transition: all 0.4s;
        cursor: pointer;
        }
        .es-bg-right-btn:hover{
            transform: scale(1.5);
        }
        }
        .es-bg-left{
        position: fixed;
        width: 40px;
        height: 100%;
        top: 0;
        left: 0px;
        animation: fade 3s;
        z-index: 1;
        background: url('@/assets/images/left-bg.png') no-repeat;
        background-size: 100% 100%;
        .es-bg-left-btn{
        width: 8px;
        height: 200px;
        margin-top: 287px;
        margin-left: 10px;
        background: url('@/assets/images/leftbtn.png') no-repeat;
        background-size: 100% 100%;
        cursor: pointer;
        transition: all 0.4s;
        }
        .es-bg-left-btn:hover{
            transform: scale(1.5);
        }
}
</style>