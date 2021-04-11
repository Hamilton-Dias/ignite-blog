import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState(postsPagination.results);

  async function handleNextPage() {
    fetch(nextPage)
      .then(response => response.json())
      .then(response => {
        setNextPage(response.next_page)

        const newPosts = response.results.map(post => {
          return {
              uid: post.uid,
              first_publication_date: format(
                new Date(post.first_publication_date),
                'dd MMM yyyy',
                {
                  locale: ptBR,
                }
              ),
              data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author
              }
          };
        })

        setPosts([...posts, ...newPosts])
      })
  }

  return(
    <>
      <Head>
        <title>Home | Blog</title>
      </Head>

      <main className={commonStyles.content}>
        <div className={styles.postList}>
          {posts.map(post => (
            <Link href={'/post/' + post.uid} key={post.uid}>
              <a>
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>
                <div>
                  <FiCalendar />
                  <span>{post.first_publication_date}</span>
                </div>
                <div>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {nextPage && <button type="button" className={styles.carregarMais} onClick={handleNextPage}>Carregar mais posts</button>}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ], {
    orderings: '[posts.first_publication_date desc]',
    pageSize: 2
  });

  const posts = postsResponse.results.map(post => {
    return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
    };
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    }
  }
};
