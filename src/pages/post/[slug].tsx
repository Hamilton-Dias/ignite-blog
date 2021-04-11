import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useEffect } from 'react';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  function geraTempoLeitura() {
    const totalPalavras = post.data.content.reduce((acc, element) => {
      return acc + element.heading.split(/\W+/).length + RichText.asText(element.body).split(/\W+/).length
    }, 0)

    return Math.ceil(totalPalavras / 200)
    // return '5'
  }

  useEffect(() => {
    let script = document.createElement("script");
    let anchor = document.getElementById("inject-comments-for-uterances");
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin","anonymous");
    script.setAttribute("async", true);
    script.setAttribute("repo", "Hamilton-Dias/ignite-blog");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute( "theme", "github-light");
    anchor.appendChild(script);
  }, []);

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
      <>
        <Head>
          <title>{post.data.title} | Blog</title>
        </Head>

        <Header />

        <img src={post.data.banner.url} alt={post.data.title} className={styles.banner} />

        <main className={commonStyles.content}>
          <div className={styles.post}>
            <h1>{post.data.title}</h1>

            <div className={styles.iconsContainer}>
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
              <div>
                <FiClock />
                <span>{geraTempoLeitura()} min</span>
              </div>
              {post.first_publication_date != post.last_publication_date && post.last_publication_date && <p><i>* {format(
                    new Date(post.last_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}</i></p>}
            </div>

            {post.data.content.map((content, index) => (
              <div className={styles.secaoConteudo} key={index}>
                <h2>{content.heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body)}}></div>
              </div>
            ))}
          </div>
        </main>

        <div id="inject-comments-for-uterances"></div>
      </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title'],
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};
