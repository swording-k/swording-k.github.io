/* Life Moments carousel — LeiBox ink-spread-carousel mounted on the about panel.
 * Photos live in images/life/, ordered by their original capture date. */
import { mountInkSpreadCarousel } from "./vendor/leibox/ink-spread-carousel/InkSpreadCarouselEngine.js?v=3";

const mountNode = document.getElementById("life-carousel");

if (mountNode) {
    mountNode.setAttribute("role", "region");
    mountNode.setAttribute("aria-label", "生活照轮播");

    const photos = [
        { src: "images/life/life-20261006.jpg", alt: "山间溪畔徒步，肩上搭着衬衫" },
        { src: "images/life/life-20260711.jpg", alt: "夏日优衣库试衣镜前的穿搭自拍" },
        { src: "images/life/life-20260726.jpg", alt: "傍晚街头路口的出行随拍" },
        { src: "images/life/life-20260809.jpg", alt: "夏夜运动后的户外随拍" },
        { src: "images/life/life-20261031.jpg", alt: "黄昏湖畔远眺城市天际线" },
        { src: "images/life/life-20261107.jpg", alt: "纸灯旁深夜写代码的房间" },
        { src: "images/life/life-20261127.jpg", alt: "绿水河畔观景台前的留念" },
    ];

    try {
        mountInkSpreadCarousel(mountNode, {
            images: photos,
            index: 0,
            duration: 1.15,
            roughness: 0.42,
        });
    } catch (error) {
        console.warn("[life-carousel] mount failed, falling back to static photo", error);
        const fallback = document.createElement("img");
        fallback.src = photos[0].src;
        fallback.alt = photos[0].alt;
        fallback.loading = "lazy";
        fallback.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
        mountNode.appendChild(fallback);
    }
}
