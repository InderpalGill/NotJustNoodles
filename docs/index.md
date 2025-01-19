---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "NWHacks 2025"
  text: "Placeholder description"
  tagline: Placeholder tagline
  actions:
    - theme: brand
      text: Jump to the project
      link: /project
---



<HorizontalContainer>
    <HorizontalCard
      title="Feature section 1"
      excerpt="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus ut felis cursus ultricies. Sed nec nunc nec nunc."
      image="https://picsum.photos/500/300"
      url="./project"
      :hideCategory="true"
      :hideAuthor="true"
      titleLines="5"
      excerptLines="5"
    />
    <HorizontalCard
      title="Feature section 2"
      excerpt="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus ut felis cursus ultricies. Sed nec nunc nec nunc."
      image="https://picsum.photos/400/300"
      url="./project"
      :hideCategory="true"
      :hideAuthor="true"
      titleLines="5"
      excerptLines="5"
    />
    <HorizontalCard
      title="Feature section 3"
      excerpt="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus ut felis cursus ultricies. Sed nec nunc nec nunc."
      image="https://picsum.photos/400/500"
      url="./project"
      :hideCategory="true"
      :hideAuthor="true"
      titleLines="5"
      excerptLines="5"
    />
  </HorizontalContainer>