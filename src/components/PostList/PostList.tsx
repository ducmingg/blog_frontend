import React, { useEffect, useRef, useState } from 'react'
import Post from './Post/Post'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { PostAPI } from '../../api/post.api'
import { ScrollRestoration } from 'react-router-dom'

export default function PostList() {
  const getPosts = PostAPI.getPosts
  const { data, isFetching, error, fetchNextPage } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => getPosts(pageParam),
    initialPageParam: new Date().toISOString(),
    getNextPageParam: (lastPage, pages) => lastPage.data.data.at(-1)?.createdAt
  })

  //lam phang page tra ve,de lay ra data that su tu apiresponse
  const posts = data?.pages.flatMap((page) => page.data.data) || []
  const lastPostRef = useRef<any>(null)

  //   👉 Lần đầu tiên useEffect chạy, nó chỉ khởi tạo IntersectionObserver để theo dõi lastPostRef.

  // 👉 Sau đó, mỗi khi lastPostRef xuất hiện trong viewport, Observer sẽ tự động gọi fetchNextPage().

  // 👉 useEffect không cần chạy lại sau mỗi lần fetch, vì Observer đã hoạt động độc lập.
  useEffect(() => {
    if (!lastPostRef.current) return
    console.log('current', lastPostRef.current)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fetchNextPage()
          }
        })
      },
      { threshold: 0.5 }
    )
    observer.observe(lastPostRef.current)
    //xu li khi component unmount
    return () => observer.disconnect()
  }, [isFetching])

  console.log(posts)
  return (
    <div className='p-2'>
      {posts.map((post, index) => {
        const isLastPost = index === posts.length - 1
        return (
          <div key={post.id} ref={isLastPost ? lastPostRef : null}>
            <Post
              id={post.id}
              username={post.username}
              crtAt={post.createdAt}
              tagName={post.tags[0]?.name}
              tagId={post.tags[0].id}
              title={post.title}
              kind={post.kind}
              body={post.body}
              upVoted={post.upVoted}
              downVoted={post.downVoted}
            />
          </div>
        )
      })}
    </div>
  )
}
