module.exports = function(grunt) {
    grunt.initConfig({
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    quiet: false,
                    clearRequireCache: false
                },
                src: ['src/server/*/tests/*.js']
            }
        },
        express: {
            options: {
                port: 3001,
                debug: false
            },
            dev: {
                options: {
                    script: 'src/server/server.js'
                }
            },
            prod: {
                options: {
                    script: 'path/to/prod/server.js',
                    node_env: 'production'
                }
            },
            test: {
                options: {
                    script: 'path/to/test/server.js'
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
            options: {
                jshintrc: '.jshintrc',
                globals: {}
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint'],
            express: {
                files: ['**/*.js'],
                tasks: ['express:dev'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-jsxhint');

    grunt.registerTask('default', ['jshint']);

    grunt.registerTask('start', ['jshint', 'mochaTest', 'express:dev', 'watch']);

    grunt.registerTask('run', ['jshint', 'express:dev', 'watch']);
};