import { StyleSheet, View } from 'react-native';

import { NewsEntity } from '@/domain/news/news.entity';

import { ArticleContent } from '../../molecules/article/article-content.js';
import { ArticleHeader } from '../../molecules/article/article-header.jsx';
import { SIZES } from '../../sizes.js';
import { AnswerButtons } from '../question/answer-buttons.js';

export function NewsFeed({
    articles,
    onAnswerClick,
}: {
    articles: NewsEntity[];
    onAnswerClick: (selectedFake: boolean) => void;
}) {
    const getSelectedAnswer = (article: NewsEntity): boolean | null => {
        const isArticleAnswered = article.answered !== undefined;

        return isArticleAnswered ? article.answered.wasCorrect === article.isFake : null;
    };

    articles.map((article) => {
        console.log('issou');
        console.log(article);
        console.log(article.answered);
    });

    return (
        <View>
            {articles.map((article) => (
                <View key={article.id} style={styles.articleContainer}>
                    <ArticleHeader
                        category={article.category}
                        headline={article.headline}
                        isAnswered={true}
                        isFake={article.isFake}
                        date={new Date(article.createdAt)}
                    />
                    <ArticleContent
                        contentWithAnnotations={article.contentWithAnnotations}
                        wasCorrect={true}
                    />
                    <AnswerButtons
                        isAnswered={!!article.answered}
                        selectedAnswer={getSelectedAnswer(article)}
                        wasCorrect={article.answered?.wasCorrect}
                        onAnswerClick={onAnswerClick}
                        onNextArticle={() => {}}
                        showNextButton={false} // TODO Delete param
                        currentArticleId={article.id} // TODO Delete param
                        article={article}
                    />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    articleContainer: {
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
        gap: SIZES.md,
        paddingVertical: SIZES.lg,
    },
});
