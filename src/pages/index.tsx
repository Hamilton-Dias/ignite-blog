import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Header from '../components/Header';

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
  preview: boolean;
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
              first_publication_date: post.first_publication_date,
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

      <Header />

      {postsPagination.preview && (
        <aside>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </aside>
      )}

      <main className={commonStyles.content}>
        <div className={styles.postList}>
          {posts.map(post => (
            <Link href={'/post/' + post.uid} key={post.uid}>
              <a>
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>
                <div>
                  <FiCalendar />
                  <span>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </span>
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

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ], {
    orderings: '[posts.first_publication_date desc]',
    pageSize: 2,
    ref: previewData?.ref ?? null
  });

  const posts = postsResponse.results.map(post => {
    return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
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
        preview,
        next_page: postsResponse.next_page,
        results: posts
      }
    }
  }
};
