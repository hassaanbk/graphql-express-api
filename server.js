const express = require('express');
const app = express();
const expressGraphQL = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLScalarType
} = require('graphql')

const professors = [
    {id:1, firstName: 'Honey', lastName: 'Singh'},
    {id:2, firstName: 'Yo', lastName: 'Yo'}
]

const courses = [
    {id:1, name: 'Amplifiya', professorId: 2},
    {id:2, name: 'Woofer', professorId: 1}
]

const CourseType = new GraphQLObjectType({
    name: 'Course',
    description: 'Represents a course by a professor',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt)},
        name: { type: GraphQLNonNull(GraphQLString)},
        professorId: { type: GraphQLNonNull(GraphQLString)},
        professor: {
            type: ProfessorType,
            resolve: (course) => {
                return professors.find(professor => professor.id === course.professorId)
            }
        }
    })
})

const ProfessorType = new GraphQLObjectType({
    name: 'Professor',
    description: 'Represents the Professor of a course',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        firstName: {type: GraphQLNonNull(GraphQLString)},
        lastName: {type: GraphQLString},
        courses: {
            type: new GraphQLList(CourseType),
            resolve: (professor) => {
                return courses.filter(course => course.professorId === professor.id )
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        course: {
            type: CourseType,
            description: 'A Single Course',
            args: {
                id: {type : GraphQLInt}
            },
            resolve: (parent, args) => courses.find(course => course.id == args.id)
        },
        courses: {
            type: new GraphQLList(CourseType),
            description: 'List of all the courses',
            resolve: () => courses
        },
        professor: {
            type: ProfessorType,
            description: 'A Single Professor',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => professors.find(professor => professor.id === args.id)
        },
        professors: {
            type: new GraphQLList(ProfessorType),
            description: 'All the Professors',
            resolve: () => professors
        },
        profile: {
            type: new GraphQLList(CourseType),
            description: 'Courses for the professor',
            args: {
                name: {type: GraphQLString}
            },
            resolve: (parent, args) => {
                const prof = professors.find(prof => prof.firstName === args.name);
                return courses.filter(course => course.professorId === prof.id)
            }
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addCourse: {
            type: CourseType,
            description: 'Add a course',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                professorId: {type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const course = {id: courses.length+1, name: args.name, professorId: args.professorId}
                courses.push(course);
                return course;
            }
        },
        addProfessor: {
            type: ProfessorType,
            description: 'Add a professor',
            args: {
                firstName: {type: GraphQLNonNull(GraphQLString)},
                lastName: {type: GraphQLString}
            },
            resolve: (parent, args) => {
                const professor = {id: professors.length+1, firstName: args.firstName, lastName: args.lastName};
                professors.push(professor);
                return professor;
            } 
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))

app.listen(5002, () => console.log('Server running on localhost:5002'))